/**
 * 接口地址解析。
 *
 * 平台已移除「应用」概念与远程应用联邦加载机制，不再有"应用优先、宿主兜底"的
 * 双层地址。所有请求统一使用宿主配置的 VITE_GLOB_API_URL。
 * 保留这个函数是为了兼容既有调用点。
 */
export function resolveApiUrl(hostApiUrl?: string): string {
  return hostApiUrl ?? '';
}
