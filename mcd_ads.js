/**
 * 麦当劳图片分流净化脚本 (v2.0) - cmkachun
 * 策略：拦截 cms 路径下的大图/广告，放行所有 UI 功能图标
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        const processImages = (target) => {
            if (typeof target === 'string' && target.includes("img.mcd.cn")) {
                const lowerTarget = target.toLowerCase();
                
                // 1. 【放行白名单】这些关键词对应你截图中的“甜品站、麦咖啡”等金刚位小图
                const whiteList = [
                    "icon", "menu", "logo", "button", "category", "tab", 
                    "nav", "thumb", "entry", "portal", "module", "index"
                ];
                if (whiteList.some(k => lowerTarget.includes(k))) {
                    return target;
                }

                // 2. 【精准拦截黑名单】拦截特定的广告 ID 和大图目录
                // 重点拦截：splash(开屏), pop(弹窗), adv(广告)
                const blackList = ["dd9407f36a1db737", "3c6b06647db3f7f1", "splash", "pop", "adv", "banner"];
                
                if (blackList.some(k => lowerTarget.includes(k))) {
                    console.log(`cmkachun: 已拦截广告大图: ${target}`);
                    return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                }

                // 3. 兜底逻辑：如果是在 cms/images 目录下，且没有图标特征的 PNG/JPG，视为潜在广告拦截
                // 如果发现 UI 依然缺失，可将此处改为 return target;
                if (lowerTarget.includes("cms/images/")) {
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

        // 4. 物理隐藏首页的广告 Section 容器，防止出现空白块
        if (obj.data && obj.data.sections) {
            const sectionBlacklist = ["video", "banner", "splash", "adv", "marketing", "pop"];
            obj.data.sections = obj.data.sections.filter(s => {
                const name = (s.sectionName || "").toLowerCase();
                // 只要模块名字里没带广告关键字，就保留，确保 UI 布局完整
                return !sectionBlacklist.some(k => name.includes(k));
            });
        }

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.(mp4|png|jpg)/g, "");
    }
}

$done({ body });
