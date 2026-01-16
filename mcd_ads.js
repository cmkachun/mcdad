/**
 * 麦当劳 JPG 开屏拦截 & UI 修复脚本 - cmkachun
 * 策略：深度过滤 cms/images 下的大图 JPG，精准保护功能图标
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        const processImages = (target) => {
            if (typeof target === 'string' && target.includes("img.mcd.cn")) {
                const lowerTarget = target.toLowerCase();
                
                // 1. 【高优先级白名单】这些通常是你的“甜品站、麦咖啡”图标，必须放行
                const whiteList = ["icon", "menu", "logo", "button", "category", "tab", "nav", "thumb", "entry", "portal", "module", "index"];
                if (whiteList.some(k => lowerTarget.includes(k))) {
                    return target;
                }

                // 2. 【核心黑名单】拦截 JPG 大图及已知的广告 ID
                const blackList = [
                    "dd9407f36a1db737", // 已知广告 JPG
                    "3c6b06647db3f7f1", // 已知广告 GIF
                    "splash",           // 开屏关键字
                    "pop",              // 弹窗关键字
                    "adv",              // 广告关键字
                    "banner"            // 横幅关键字
                ];
                
                // 3. 增强逻辑：如果图片在 cms/images 目录下且是 jpg，且没在白名单里，大概率是新的开屏图
                if (blackList.some(k => lowerTarget.includes(k)) || 
                   (lowerTarget.includes("cms/images/") && lowerTarget.endsWith(".jpg"))) {
                    console.log(`cmkachun: 已拦截 JPG 广告大图: ${target}`);
                    return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                }
                
                return target;
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

        // 物理删除首页广告容器，确保布局自动向上坍缩
        if (obj.data && obj.data.sections) {
            const sectionBlacklist = ["video", "banner", "splash", "adv", "marketing", "pop"];
            obj.data.sections = obj.data.sections.filter(s => {
                const name = (s.sectionName || "").toLowerCase();
                return !sectionBlacklist.some(k => name.includes(k));
            });
        }

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
