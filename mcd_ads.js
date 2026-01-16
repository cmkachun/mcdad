/**
 * 麦当劳 PNG/JPG 全拦截脚本 - cmkachun
 * 策略：深度清理 cms 目录下的所有静态资源，仅放行核心 UI 标识图
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        const processImages = (target) => {
            if (typeof target === 'string' && target.includes("img.mcd.cn")) {
                const lowerTarget = target.toLowerCase();
                
                // 1. 【核心白名单】这些是维持“甜品站、麦咖啡”UI 正常的关键词
                const uiWhiteList = ["icon", "menu", "logo", "button", "category", "tab", "nav", "thumb", "entry", "portal", "module", "index"];
                if (uiWhiteList.some(k => lowerTarget.includes(k))) {
                    return target;
                }

                // 2. 【核心黑名单】拦截所有 cms/images 下的图片，不管后缀是 png 还是 jpg
                // 因为正常的 UI 图标通常不在这个路径，或者名字里带有 icon
                if (lowerTarget.includes("cms/images/")) {
                    console.log(`cmkachun: 已拦截广告路径资源: ${target}`);
                    return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                }

                // 3. 拦截已知的广告关键词
                const adKeywords = ["splash", "pop", "adv", "banner", "marketing"];
                if (adKeywords.some(k => lowerTarget.includes(k))) {
                    return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
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

        // 物理删除首页 Section 容器，防止出现你截图中那个“带旗子的汉堡”占位符
        if (obj.data && obj.data.sections) {
            const sectionBlacklist = ["video", "banner", "splash", "adv", "marketing", "pop", "indexvideo"];
            obj.data.sections = obj.data.sections.filter(s => {
                const name = (s.sectionName || "").toLowerCase();
                const type = (s.sectionType || "").toLowerCase();
                return !sectionBlacklist.some(k => name.includes(k) || type.includes(k));
            });
        }

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.(mp4|png|jpg)/g, "");
    }
}

$done({ body });
