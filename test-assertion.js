function test(rawResp) {
    const resp = rawResp;
    if (resp.success) {
        console.log(resp.noteTypes);
    }
    else {
        console.log(resp.message);
    }
}
export {};
