export function useProxyConfig(proxy: Record<string, any>) {
    const proxyConfig = proxy?.host && proxy.port ? {
        protocol: "http",
        host: proxy?.host,
        port: proxy?.port
    } : undefined

    return proxyConfig
}