function initMoviePlayer(videoId, buttonId, src) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;

    if (!video || !button || !src) {
        return;
    }

    function bind() {
        if (hlsInstance || video.getAttribute('src')) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }
        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            return;
        }
        video.src = src;
    }

    function start() {
        bind();
        button.classList.add('is-hidden');
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    bind();
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
    });
}
