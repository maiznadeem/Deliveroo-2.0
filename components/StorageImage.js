import React, { useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import useStorageAuthHeaders, { refreshStorageHeaders } from '../hooks/useStorageAuthHeaders';

const STORAGE_PREFIX = 'https://firebasestorage.googleapis.com/';
const PLACEHOLDER = 'bg-surface-alt dark:bg-surface-alt-dark';

// Drop-in replacement for <Image>. Firebase Storage URLs are fetched with the signed-in user's ID token (and
// the App Check token when available); everything else (other URLs, require() assets) is passed through.
// While the tokens load, or if the image can't be loaded, a neutral placeholder is shown instead.
export default function StorageImage({ source, className, style, onError, ...props }) {
  const uri = source && typeof source === 'object' && !Array.isArray(source) ? source.uri : undefined;
  const isStorage = typeof uri === 'string' && uri.startsWith(STORAGE_PREFIX);
  const { status, headers } = useStorageAuthHeaders(isStorage);
  const [failedUri, setFailedUri] = useState(null);
  const [retried, setRetried] = useState(false);

  useEffect(() => {
    setFailedUri(null);
    setRetried(false);
  }, [uri]);
  // New headers (after a refresh) give a failed image one more try.
  useEffect(() => setFailedUri(null), [headers]);

  const authedSource = useMemo(
    () => (isStorage && headers ? { ...source, headers: { ...source.headers, ...headers } } : null),
    [isStorage, headers, source]
  );

  if (!isStorage) {
    if (!source) return <View className={`${PLACEHOLDER} ${className ?? ''}`} style={style} />;
    return <Image source={source} className={className} style={style} onError={onError} {...props} />;
  }

  if (status !== 'ready' || !authedSource || failedUri === uri) {
    return <View className={`${PLACEHOLDER} ${className ?? ''}`} style={style} />;
  }

  return (
    <Image
      source={authedSource}
      className={`${PLACEHOLDER} ${className ?? ''}`}
      style={style}
      onError={(event) => {
        console.log('[StorageImage] failed to load', uri, event?.nativeEvent?.error ?? '');
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
