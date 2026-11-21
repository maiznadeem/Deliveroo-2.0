import React, { memo, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { cssInterop } from 'nativewind';
import useStorageAuthHeaders, { refreshStorageHeaders } from '../hooks/useStorageAuthHeaders';
import { perfMark } from '../helpers/perf';
import { hideSplash } from '../helpers/splash';

cssInterop(ExpoImage, { className: 'style' });

const STORAGE_PREFIX = 'https://firebasestorage.googleapis.com/';
const PLACEHOLDER = 'bg-surface-alt dark:bg-surface-alt-dark';
const CONTENT_FIT = { cover: 'cover', contain: 'contain', stretch: 'fill', center: 'none' };

// Drop-in replacement for <Image>, built on expo-image (memory + disk cache). Firebase Storage URLs are fetched
// with the signed-in user's ID token and App Check token; everything else (other URLs, require() assets) is
// passed through. The disk cache is keyed by URL, so an image fetched once is shown instantly on the next
// launch, before the tokens are even ready. While nothing can be shown, or if the image can't be loaded, a
// neutral placeholder is shown instead.
function StorageImage({ source, className, style, resizeMode = 'cover', onError, onLoad, ...props }) {
  const uri = source && typeof source === 'object' && !Array.isArray(source) ? source.uri : undefined;
  const isStorage = typeof uri === 'string' && uri.startsWith(STORAGE_PREFIX);
  const { status, headers } = useStorageAuthHeaders(isStorage);
  const [failedUri, setFailedUri] = useState(null);
  const [retried, setRetried] = useState(false);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    setFailedUri(null);
    setRetried(false);
    setCached(false);
  }, [uri]);
  // New headers (after a refresh) give a failed image one more try.
  useEffect(() => setFailedUri(null), [headers]);

  // Before the tokens are ready, an image that is already on disk can be shown right away.
  useEffect(() => {
    if (!isStorage || headers) return undefined;
    let cancelled = false;
    ExpoImage.getCachePathAsync(uri)
      .then((path) => !cancelled && setCached(!!path))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isStorage, headers, uri]);

  const authedSource = useMemo(() => {
    if (!isStorage) return source;
    if (headers) return { ...source, headers: { ...source.headers, ...headers } };
    return cached ? { ...source } : null;
  }, [isStorage, headers, cached, source]);

  const fit = CONTENT_FIT[resizeMode] ?? 'cover';

  if (!isStorage) {
    if (!source) return <View className={`${PLACEHOLDER} ${className ?? ''}`} style={style} />;
    return <ExpoImage source={source} className={className} style={style} contentFit={fit} onError={onError} onLoad={onLoad} {...props} />;
  }

  if (!authedSource || failedUri === uri || (status === 'signedOut' && !cached)) {
    return <View className={`${PLACEHOLDER} ${className ?? ''}`} style={style} />;
  }

  return (
    <ExpoImage
      source={authedSource}
      className={`${PLACEHOLDER} ${className ?? ''}`}
      style={style}
      contentFit={fit}
      cachePolicy="memory-disk"
      recyclingKey={uri}
      transition={120}
      onLoad={(event) => {
        perfMark('first-storage-image-loaded');
        hideSplash(); // no-op once hidden: a cached image is on screen, so the splash can hand over
        onLoad?.(event);
      }}
      onError={(event) => {
        console.log('[StorageImage] failed to load', uri, event?.error ?? '');
        setFailedUri(uri);
        if (!retried) {
          setRetried(true);
          refreshStorageHeaders();
        }
        onError?.(event);
      }}
      {...props}
    />
  );
}

export default memo(StorageImage);
