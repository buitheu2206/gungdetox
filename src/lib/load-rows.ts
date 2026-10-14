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

export function countOrdersByCustomer(orders: { id: string; phone: string; created_at: string }[]) {
  const counts = new Map<string, number>();
  const byPhone = new Map<string, number>();
  const sorted = [...orders].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (let start = 0; start < sorted.length;) {
    let end = start;
    while (end < sorted.length && sorted[end].created_at === sorted[start].created_at) {
      const phone = sorted[end++].phone;
      byPhone.set(phone, (byPhone.get(phone) ?? 0) + 1);
    }
    for (let index = start; index < end; index++) counts.set(sorted[index].id, byPhone.get(sorted[index].phone)!);
    start = end;
  }
  return counts;
}
