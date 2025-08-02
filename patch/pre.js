Module['preRun'] = [() => {
    //ENV['ROGUEOPTS'] = 'color,rank,slime,idscrl,name=adventurer';

    const url = new URL(import.meta.url);
    const dir = url.pathname.substring(0, url.pathname.lastIndexOf('/'));

    FS.mkdir('/home/web_user/.terminfo', 555);
    FS.mkdir('/home/web_user/.terminfo/x', 555);
    FS.createPreloadedFile(
        '/home/web_user/.terminfo/x',
        'xterm-256color',
        `${dir}/xterm-256color`,
        true,
        false,
    );
    FS.createPreloadedFile(
        '/',
        'rogue.ttl',
        `${dir}/rogue.ttl`,
        true,
        false,
    );
}];
