/**
 * 麦当劳布局净化脚本 (修复日历版) - cmkachun
 * 策略：保留所有功能模块，仅抹除明确的广告数据
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        if (url.includes("/bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                // 仅物理删除确定没有业务功能的广告容器
                const hardBlacklist = ["video", "splash", "indexvideo"];
                obj.data.sections = obj.data.sections.filter(s => {
                    const name = (s.sectionName || "").toLowerCase();
                    const type = (s.sectionType || "").toLowerCase();
                    // 只要名字里没带这几个词，就保留布局，确保图标有位置显示
                    return !hardBlacklist.some(k => name.includes(k) || type.includes(k));
                });
            }
        }

        // 深度清理：将所有指向广告目录的链接替换为透明像素
        const cleanUrls = (target) => {
            if (typeof target === 'string') {
                const lower = target.toLowerCase();
                // 拦截规则：包含广告关键字 且 不包含日历关键字
                if (lower.includes("img.mcd.cn") && 
                   (lower.includes("splash") || lower.includes("pop") || lower.includes("adv")) && 
                   !lower.includes("calendar")) {
                    return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                }
            } else if (Array.isArray(target)) {
                return target.map(cleanUrls);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    target[key] = cleanUrls(target[key]);
                }
            }
            return target;
        };
        obj = cleanUrls(obj);

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
