jQuery(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction('frontend/element_ready/rtm_video_button.default', function ($scope, $) {
        let $button = $scope.find('#video-button');

        if (!$button.length) return;

        // Ambil nilai dari data attribute secara langsung
        let autoplay = $button.attr('data-autoplay') === 'yes';
        let muted = $button.attr('data-muted') === 'yes';
        let loop = $button.attr('data-loop') === 'yes';
        let playerControl = $button.attr('data-player-control') === 'yes';

        // Inisialisasi GLightbox
        GLightbox({
            selector: '.glightbox',
            autoplayVideos: autoplay,
            plyr: {
                config: {
                    autoplayVideos: autoplay,
                    muted: muted,
                    loop: { active: loop },
                    controls: playerControl
                    ? ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
                    : [], 
                }
            }
        });
    });
});
