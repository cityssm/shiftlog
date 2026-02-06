function test(resp) {
    if (resp.success) {
        console.log(resp.noteTypes);
    }
    else {
        console.log(resp.message);
    }
}
export {};
