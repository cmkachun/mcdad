let body = $response.body;
if (body) {
    // 无论地址怎么换，只要包含 mp4 的字符直接破坏掉链接
    body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png");
    
    try {
        let obj = JSON.parse(body);
        // 彻底删除首页所有视频相关的布局块
        if (obj.data && obj.data.sections) {
            obj.data.sections = obj.data.sections.filter(s => !["video", "splash", "adv"].some(k => (s.sectionName||"").toLowerCase().includes(k)));
        }
        body = JSON.stringify(obj);
    } catch (e) {}
}
$done({ body });
