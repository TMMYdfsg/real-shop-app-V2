/**
 * useConditionalReload
 * 管理画面でのみ10秒後に自動リロードする仕組みを提供
 * データ変更を検知して、10秒後に自動的にリロード
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseConditionalReloadOptions {
  // 管理画面かどうかを判定する関数
  isAdminScreen?: () => boolean;
  // リロード前のコールバック
  onBeforeReload?: () => void;
  // リロード後のコールバック
  onAfterReload?: () => void;
  // デリバウンス時間（ミリ秒）
  debounceMs?: number;
  // リロード前の待機時間（ミリ秒）
  delayBeforeReloadMs?: number;
  // 強制リロードかどうか
  forceReload?: boolean;
}

/**
 * リロード処理を条件付きで実行するカスタムフック
 */
export function useConditionalReload(options: UseConditionalReloadOptions = {}) {
  const {
    isAdminScreen = () => false,
    onBeforeReload,
    onAfterReload,
    debounceMs = 1000,
    delayBeforeReloadMs = 10000, // デフォルト10秒
    forceReload = false,
  } = options;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasReloadScheduledRef = useRef(false);

  // 前回のリロード実行時刻を記録
  const lastReloadTimeRef = useRef<number>(0);

  // リロードをスケジュール
  const scheduleReload = useCallback(() => {
    // 管理画面 かつ 強制リロード有効 の場合のみ実行
    if (!isAdminScreen() && !forceReload) {
      return;
    }

    // 既にリロードがスケジュールされている場合はスキップ
    if (hasReloadScheduledRef.current) {
      return;
    }

    // デリバウンス中のタイマーをクリア
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // デリバウンス処理
    debounceRef.current = setTimeout(() => {
      hasReloadScheduledRef.current = true;

      // リロード前のコールバック実行
      onBeforeReload?.();

      // 指定時間後にリロード
      timeoutRef.current = setTimeout(() => {
        console.log('[useConditionalReload] Reloading...');
        
        // リロード後のコールバック実行
        onAfterReload?.();

        // ページをリロード
        window.location.reload();

        // リロード時刻を更新
        lastReloadTimeRef.current = Date.now();

        // フラグをリセット
        hasReloadScheduledRef.current = false;
      }, delayBeforeReloadMs);
    }, debounceMs);
  }, [isAdminScreen, onBeforeReload, onAfterReload, debounceMs, delayBeforeReloadMs, forceReload]);

  // リロードをキャンセル
  const cancelReload = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    hasReloadScheduledRef.current = false;
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    scheduleReload,
    cancelReload,
    hasReloadScheduled: hasReloadScheduledRef.current,
  };
}

/**
 * ゲーム状態の更新を検知してリロードをスケジュールするフック
 */
export function useAutoReloadOnStateChange(
  triggerRevision?: number,
  options: UseConditionalReloadOptions = {}
) {
  const { scheduleReload } = useConditionalReload(options);
  const prevRevisionRef = useRef<number | undefined>(triggerRevision);

  useEffect(() => {
    if (
      triggerRevision !== undefined &&
      prevRevisionRef.current !== undefined &&
      triggerRevision !== prevRevisionRef.current
    ) {
      console.log(
        `[useAutoReloadOnStateChange] State changed from ${prevRevisionRef.current} to ${triggerRevision}`
      );
      scheduleReload();
    }
    prevRevisionRef.current = triggerRevision;
  }, [triggerRevision, scheduleReload]);
}

export default useConditionalReload;
