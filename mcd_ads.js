/**
 * 麦当劳去广告脚本 - 终极分流版
 * 策略：宁可误杀大图，绝不放过开屏；全力保护 UI 图标
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 递归处理所有字段
        const smartFilter = (target) => {
            if (typeof target === 'string') {
                if (target.includes("img.mcd.cn")) {
                    const lowerTarget = target.toLowerCase();
                    
                    // 1. 【白名单】这些关键字的图片绝对是 UI，直接放行
                    const whiteList = ["icon", "menu", "logo", "button", "category", "tab", "nav", "thumb", "avatar"];
                    if (whiteList.some(k => lowerTarget.includes(k))) {
                        return target;
                    }

                    // 2. 【黑名单】只要命中这些，必死无疑
                    const blackList = ["splash", "pop", "adv", "banner", "marketing", "video", "dd9407f36a1db737", "3c6b06647db3f7f1"];
                    if (blackList.some(k => lowerTarget.includes(k))) {
                        return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                    }

                    // 3. 【灰度逻辑】针对你说的“又有开屏了”，如果路径很深且没写是 icon，大概率是预下载的开屏大图
                    // 拦截 cms/images 下所有不带 icon 关键字的资源
                    if (lowerTarget.includes("cms/images/")) {
                        console.log(`cmkachun: 疑似拦截到隐藏开屏大图: ${target}`);
                        return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                    }
                }
            } else if (Array.isArray(target)) {
                return target.map(smartFilter);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    target[key] = smartFilter(target[key]);
                }
            }
            return target;
        };

        obj = smartFilter(obj);

        // 首页布局物理剔除 (继续保持)
        if (obj.data && obj.data.sections) {
            const sectionAdKeywords = ["video", "banner", "splash", "adv", "pop", "marketing", "remind"];
            obj.data.sections = obj.data.sections.filter(s => {
                const name = (s.sectionName || "").toLowerCase();
                return !sectionAdKeywords.some(k => name.includes(k));
            });
        }

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
