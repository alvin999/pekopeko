/**
 * 取得指定日期的當地 YYYY-MM-DD 字串
 * 這種格式在資料庫 DATE 欄位與 HTML5 Date Input 中最為通用，且不受各時區實作差異影響。
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 取得下一個日期的開始時間（午夜 0 點）
 * 用於計算剩餘時間。
 */
export function getNextMidnight(date: Date = new Date()): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

/**
 * 驗證貼文日期是否在伺服器日期的合法範圍內（+/- 1天）
 * 這能提前在前端攔截錯誤，減少無用的伺服器請求。
 */
export function isValidPostDate(postDate: string, serverDate: string = getLocalDateString()): boolean {
  const post = new Date(postDate).getTime();
  const server = new Date(serverDate).getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  
  // 差距絕對值必須小於等於 1 天 (86400000 毫秒)
  return Math.abs(post - server) <= ONE_DAY_MS;
}
