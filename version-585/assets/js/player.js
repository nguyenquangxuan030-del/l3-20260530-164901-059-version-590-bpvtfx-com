(() => {
    const players = document.querySelectorAll('[data-player]');

    players.forEach((player) => {
        const video = player.querySelector('video[data-hls]');
        const overlay = player.querySelector('[data-play-toggle].player-overlay');
        const playButtons = player.querySelectorAll('[data-play-toggle]');
        const muteButton = player.querySelector('[data-mute-toggle]');
        const fullscreenButton = player.querySelector('[data-fullscreen-toggle]');
        const status = player.querySelector('[data-player-status]');
        const source = video?.dataset.hls;
        let hls = null;
        let initialized = false;

        if (!video || !source) {
            if (status) {
                status.textContent = '未找到可用播放源。';
                status.classList.add('is-error');
            }
            return;
        }

        const setStatus = (message, isError = false) => {
            if (!status) {
                return;
            }
            status.textContent = message;
            status.classList.toggle('is-error', isError);
        };

        const initialize = () => {
            if (initialized) {
                return;
            }
            initialized = true;
            setStatus('正在加载 HLS 播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    setStatus('播放源加载完成，可开始观看。');
                });
                hls.on(window.Hls.Events.ERROR, (_event, data) => {
                    if (!data?.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络加载异常，正在重试播放源。', true);
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体解码异常，正在尝试恢复。', true);
                        hls.recoverMediaError();
                    } else {
                        setStatus('视频加载失败，请稍后重试。', true);
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('当前浏览器使用原生 HLS 播放。');
            } else {
                setStatus('当前浏览器不支持 HLS，请换用新版 Chrome、Edge、Safari 或移动端浏览器。', true);
            }
        };

        const play = async () => {
            initialize();
            try {
                await video.play();
            } catch (error) {
                setStatus('浏览器阻止了自动播放，请再次点击播放按钮。', true);
            }
        };

        playButtons.forEach((button) => {
            button.addEventListener('click', () => {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
        });

        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', () => {
            overlay?.classList.add('is-hidden');
            setStatus('正在播放。');
        });

        video.addEventListener('pause', () => {
            overlay?.classList.remove('is-hidden');
            setStatus('已暂停，点击可继续播放。');
        });

        video.addEventListener('loadedmetadata', () => {
            setStatus('视频信息加载完成。');
        });

        muteButton?.addEventListener('click', () => {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '取消静音' : '静音';
        });

        fullscreenButton?.addEventListener('click', () => {
            const target = player.querySelector('.video-shell') || video;
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (target.requestFullscreen) {
                target.requestFullscreen();
            }
        });

        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
