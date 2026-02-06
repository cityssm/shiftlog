function test(resp) {
    if (resp.type === 'success') {
        console.log(resp.noteTypes);
    }
    else {
        console.log(resp.message);
    }
}
export {};
