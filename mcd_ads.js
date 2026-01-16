/**
 * 麦当劳图片精准分流脚本 - cmkachun
 * 策略：放行 UI 图标，拦截全屏开屏与广告
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 递归处理函数：区分 UI 图片和广告图片
        const processImages = (target) => {
            if (typeof target === 'string') {
                if (target.includes("img.mcd.cn")) {
                    // 1. 白名单：明确是图标或菜单类的关键词，直接放行
                    const whiteList = ["icon", "menu", "logo", "button", "category", "tab"];
                    if (whiteList.some(k => target.toLowerCase().includes(k))) {
                        return target; 
                    }

                    // 2. 黑名单：已知的广告 ID 或开屏/弹窗专用目录
                    const blackList = [
                        "dd9407f36a1db737", // 你之前抓到的广告图
                        "3c6b06647db3f7f1", // 之前的 GIF
                        "splash",           // 开屏目录
                        "pop",              // 弹窗目录
                        "adv"               // 广告目录
                    ];
                    
                    if (blackList.some(k => target.toLowerCase().includes(k))) {
                        console.log(`cmkachun: 已精准拦截大图广告: ${target}`);
                        return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                    }
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

        // 执行分流逻辑
        obj = processImages(obj);

        // 首页布局物理隐藏（移除广告 Section，保留功能 Section）
        if (url.includes("/bff/portal/home") && obj.data && obj.data.sections) {
            const sectionBlacklist = ["video", "banner", "splash", "adv", "marketing", "pop"];
            obj.data.sections = obj.data.sections.filter(s => {
                const name = (s.sectionName || "").toLowerCase();
                // 只要模块名字里没包含广告关键字，就保留，防止误伤
                return !sectionBlacklist.some(k => name.includes(k));
            });
        }

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
