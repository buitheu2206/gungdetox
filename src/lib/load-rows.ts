// Read every page, including projects whose API cap is lower than the requested page size.
export const ROW_PAGE_SIZE = 500;

export async function loadAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  while (true) {
    const { data, error } = await fetchPage(rows.length, rows.length + ROW_PAGE_SIZE - 1);
    if (error) throw new Error(`Không tải được dữ liệu: ${error.message}`);
    if (!data?.length) return rows;
    rows.push(...data);
  }
}
