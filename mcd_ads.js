/**
 * 麦当劳去广告终极版 - cmkachun
 * 策略：逻辑抹除 + 资源占位替换 (不误伤 UI 图片)
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理版本配置接口 (version/mdl)
        if (url.includes("bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                // 彻底移除开屏和弹窗模块定义
                const blacklist = ["splash", "pop", "adv", "video", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !blacklist.some(k => mName.includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        // 2. 处理首页布局接口 (home)
        if (url.includes("bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                obj.data.sections = obj.data.sections.filter(s => {
                    const sName = (s.sectionName || "").toLowerCase();
                    // 移除首页那个讨厌的视频位和广告位
                    const isAd = ["video", "splash", "adv", "banner"].some(k => sName.includes(k));
                    return !isAd;
                });
            }
        }

        // 3. 全局替换：将所有指向开屏可能用到的 mp4 或大图链接替换为 1x1 透明图
        // 这样既不会导致 App 因为找不到资源而报错，也不会显示广告
        let rawBody = JSON.stringify(obj);
        rawBody = rawBody.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.(mp4|gif)/g, "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png");
        
        body = rawBody;
    } catch (e) {
        // 非 JSON 则尝试正则替换
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
