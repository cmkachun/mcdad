/**
 * 麦当劳首页广告位精准剔除脚本 - cmkachun
 * 目标：拦截 dd94...jpg 并隐藏占位符
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理首页布局接口 (针对 api2 域名)
        if (url.includes("/bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                // 定义所有需要剔除的模块关键词，确保包含 banner 和 marketing
                const blacklist = ["video", "banner", "splash", "adv", "hot", "marketing", "pop", "indexvideo"];
                
                obj.data.sections = obj.data.sections.filter(s => {
                    const sName = (s.sectionName || "").toLowerCase();
                    const sType = (s.sectionType || "").toLowerCase();
                    
                    // 检查模块中是否包含你提到的那个特定图片链接
                    const rawSection = JSON.stringify(s);
                    const containsTargetImg = rawSection.includes("dd9407f36a1db737.jpg");
                    
                    // 匹配黑名单关键词或包含目标图片的模块
                    const isAd = containsTargetImg || blacklist.some(k => sName.includes(k) || sType.includes(k));
                    
                    if (isAd) {
                        console.log(`cmkachun: 已物理隐藏包含目标图片的模块 [${sName}]`);
                        return false; 
                    }
                    return true;
                });
            }
        }

        // 2. 版本配置清理
        if (url.includes("/bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                const moduleBlacklist = ["splash", "pop", "adv", "video", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    return !moduleBlacklist.some(k => (m.moduleName || "").toLowerCase().includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 如果不是 JSON，直接抹除链接
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.(mp4|jpg)/g, "");
    }
}

$done({ body });
