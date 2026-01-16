/**
 * 麦当劳预下载拦截脚本 - cmkachun
 * 策略：破坏预下载链接，防止 PNG 缓存到本地
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);
        
        // 1. 深度遍历并破坏所有潜在的广告/开屏图片下载链接
        const destroyAdLinks = (target) => {
            if (typeof target === 'string') {
                // 如果字符串包含图片域名，且路径里有广告/开屏关键字
                if (target.includes("img.mcd.cn") && 
                   (target.includes("splash") || target.includes("adv") || target.includes("pop") || target.includes("cms/images"))) {
                    console.log(`cmkachun: 已破坏预下载链接: ${target}`);
                    return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png"; // 替换为 1x1 透明图
                }
            } else if (Array.isArray(target)) {
                return target.map(destroyAdLinks);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    target[key] = destroyAdLinks(target[key]);
                }
            }
            return target;
        };

        // 2. 针对首页、弹窗、提醒、版本配置等所有接口执行破坏逻辑
        obj = destroyAdLinks(obj);

        // 3. 首页模块物理删除（防止留下空白位）
        if (obj.data && obj.data.sections) {
            const blacklist = ["video", "banner", "splash", "adv", "marketing", "pop", "remind"];
            obj.data.sections = obj.data.sections.filter(s => {
                const name = (s.sectionName || "").toLowerCase();
                return !blacklist.some(k => name.includes(k));
            });
        }

        // 4. 强制开启审计模式
        if (obj.hasOwnProperty('audit')) obj.audit = true;

        body = JSON.stringify(obj);
    } catch (e) {
        // 兜底：直接替换所有可能的图片链接
        body = body.replace(/https?:\/\/img\.mcd\.cn\/cms\/images\/[^"\s]+\.(png|jpg|gif)/g, "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png");
    }
}

$done({ body });
