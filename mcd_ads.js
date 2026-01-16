/**
 * 麦当劳首页广告位物理蒸发脚本 - cmkachun
 * 目标：彻底消除 api2 域名下的空白占位符
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理首页布局接口 (api2/bff/portal/home)
        if (url.includes("/bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                // 增加更多的过滤关键词，确保覆盖所有广告类型
                const blacklist = [
                    "video", "splash", "adv", "banner", "hot", 
                    "pop", "float", "marketing", "indexvideo"
                ];
                
                obj.data.sections = obj.data.sections.filter(s => {
                    const sName = (s.sectionName || "").toLowerCase();
                    const sType = (s.sectionType || "").toLowerCase();
                    // 检查名字或类型是否包含黑名单词汇
                    const isAd = blacklist.some(k => sName.includes(k) || sType.includes(k));
                    
                    if (isAd) {
                        console.log(`cmkachun: 已成功物理删除首页模块 [${sName}]`);
                        return false; 
                    }
                    return true;
                });
            }
        }

        // 2. 处理版本配置接口 (api2/bff/portal/version/mdl)
        if (url.includes("/bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                const moduleBlacklist = ["splash", "pop", "adv", "video", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !moduleBlacklist.some(k => mName.includes(k));
                });
            }
            // 开启审计模式，有助于隐藏某些广告位
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 兜底：抹除所有 mp4 地址
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
