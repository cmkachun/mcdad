/**
 * 麦当劳首页布局清理终极版 - cmkachun
 * 目标：彻底移除 api2 接口下发的首页空白占位符
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理 api2 首页布局接口
        if (url.includes("/bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                // 定义所有首页干扰模块的关键词
                const blacklist = ["video", "banner", "splash", "adv", "hot", "marketing", "pop", "indexvideo"];
                
                obj.data.sections = obj.data.sections.filter(section => {
                    const sName = (section.sectionName || "").toLowerCase();
                    const sType = (section.sectionType || "").toLowerCase();
                    
                    // 如果模块名称或类型包含黑名单关键词，直接删除
                    const isAd = blacklist.some(k => sName.includes(k) || sType.includes(k));
                    
                    if (isAd) {
                        console.log(`cmkachun: 已物理隐藏首页占位块: ${sName}`);
                        return false;
                    }
                    return true;
                });
            }
        }

        // 2. 处理版本配置接口
        if (url.includes("/bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                const moduleBlacklist = ["splash", "pop", "adv", "video", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !moduleBlacklist.some(k => mName.includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 兜底：抹除所有可能导致加载占位的视频链接
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
