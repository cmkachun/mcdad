/**
 * 麦当劳首页布局深度清理 - cmkachun
 * 目标：消除首页空白占位符
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理首页布局接口 (解决白色块的关键)
        if (url.includes("bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                // 过滤首页所有模块，删除视频、海报、热门推荐位
                obj.data.sections = obj.data.sections.filter(section => {
                    const sName = (section.sectionName || "").toLowerCase();
                    // 只要包含这些词的布局块，直接删除数据
                    const isAdBlock = ["video", "banner", "hot", "splash", "adv", "pop"].some(k => sName.includes(k));
                    if (isAdBlock) console.log(`cmkachun: 已拦截布局块 [${sName}]`);
                    return !isAdBlock;
                });
            }
        }

        // 2. 处理版本配置接口
        if (url.includes("bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                const blacklist = ["splash", "pop", "adv", "video", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !blacklist.some(k => mName.includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 如果 JSON 解析失败，执行基础替换
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
