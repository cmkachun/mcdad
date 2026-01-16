/**
 * 麦当劳 UI 图标找回版脚本 - cmkachun
 * 策略：深度保护金刚位图标，精准剔除全屏广告
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        const processImages = (target) => {
            if (typeof target === 'string') {
                if (target.includes("img.mcd.cn")) {
                    const lowerTarget = target.toLowerCase();
                    
                    // 1. 【强力白名单】只要包含这些词，说明是功能图标，绝对放行
                    // 增加 portal, module, entry 等关键词，这些通常是首页图标的路径
                    const whiteList = ["icon", "menu", "logo", "button", "category", "tab", "nav", "thumb", "entry", "portal", "module", "index"];
                    if (whiteList.some(k => lowerTarget.includes(k))) {
                        return target;
                    }

                    // 2. 【强力黑名单】拦截已知的开屏和广告 ID
                    const blackList = ["dd9407f36a1db737", "3c6b06647db3f7f1", "splash", "pop"];
                    if (blackList.some(k => lowerTarget.includes(k))) {
                        console.log(`cmkachun: 精准拦截广告大图: ${target}`);
                        return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                    }
                    
                    // 3. 其他路径默认放行，确保 UI 正常显示
                    return target;
                }
            } else if (Array.isArray(target)) {
                return target.map(processImages);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    target[key] = processImages(target[key]);
                }
            }
            return target;
        };

        obj = processImages(obj);

        // 首页布局处理：物理删除广告位，让下方内容自动上移
        if (obj.data && obj.data.sections) {
            const sectionBlacklist = ["video", "banner", "splash", "adv", "marketing", "pop"];
            obj.data.sections = obj.data.sections.filter(s => {
                const name = (s.sectionName || "").toLowerCase();
                const type = (s.sectionType || "").toLowerCase();
                // 仅删除明确标记为广告的容器，保留图标所在的容器
                return !sectionBlacklist.some(k => name.includes(k) || type.includes(k));
            });
        }

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
