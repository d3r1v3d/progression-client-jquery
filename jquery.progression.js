(function($) {

    $.fn.progression = function(userOptions) {
        var opts = {
            serverUrl: undefined,
            user: undefined
        },
        log = function(message) {
            if (window.console) console.log(message);
        },
        getDurationText = function(startDate, endDate, brief) {
            if (!brief) brief = false;

            var duration_ms = endDate.getTime() - startDate.getTime(),
                isCountingDown = duration_ms < 0;
            
            duration_ms = Math.abs(duration_ms);

            var daysElapsed = Math.floor(duration_ms / (24 * 60 * 60 * 1e3)),
                hoursRemainder = Math.floor((duration_ms / (60 * 60 * 1e3)) % 24),
                minutesRemainder = Math.floor((duration_ms / (60 * 1e3)) % 60),
                secondsRemainder = Math.floor((duration_ms / 1e3) % 60);

            return '<span class="days"'
                   + (!daysElapsed ? ' style="color: red;"' : '')
                   + '>' + daysElapsed + '</span> days' 
                   + (brief ? ''
                            : ', ' + '<span class="hours">' + (hoursRemainder < 10 ? '0' + hoursRemainder : hoursRemainder) + '</span>:' 
                                   + '<span class="minutes">' + (minutesRemainder < 10 ? '0' + minutesRemainder : minutesRemainder) + '</span>:' 
                                   + '<span class="seconds">' + (secondsRemainder < 10 ? '0' + secondsRemainder : secondsRemainder) + '</span>')
                   + (isCountingDown ? ' to go' : ' so far');
        };

        if (userOptions) $.extend(opts, userOptions);
        if (!opts.serverUrl) {
            log('No Progression server URL was defined - cannot continue.');
            return this;
        }

        var jsonpUrl = opts.serverUrl.replace(/[?]/g, '') + '?'
                       + (opts.user ? (parseInt(opts.user) ? 'uid=' : 'user=') + opts.user : ''),
            $selectors = this;

        $.ajax({
            url: jsonpUrl,
            dataType: 'jsonp',
            success: function(response) {
                if (!response) return;

                $selectors.each(function() {
                    for (var ctr = 0; ctr < response.length; ctr++) {
                        var $counter = $(
                            '<div class="counter">'
                                + '<div class="label"><div class="internal"></div></div>'
                                + '<div class="progression"><div class="internal"></div></div>'
                                + '<div class="description"><div class="internal"></div></div>'
                                + '<div style="clear: both;"></div>'
                            + '</div>'
                        ).appendTo(this);

                        $('.label .internal', $counter).html(response[ctr].title);

                        var description = $.trim(response[ctr].description),
                            $description = $('.description .internal', $counter);
                        if (description) {
                            $description.html(description);
                        }
                        else {
                            $description.hide();
                        }

                        // TODO: for now, we're always adding an hour to the target date to ensure DST doesn't kick us back one day earlier.
                        //       however, support for DST really needs to be handled better
                        var targetDate = new Date(response[ctr].targetDate * 1e3 + (60 * 60 * 1e3)),
                            rangeBound = new Date();

                        targetDate.setHours(0);
                        targetDate.setMinutes(0);
                        targetDate.setSeconds(0);
                        targetDate.setMilliseconds(0);

                        $('.progression .internal', $counter).html(getDurationText(targetDate, rangeBound, true));
                    }
                });
            },
            error: function(request, textStatus, errorThrown) {
                log('An error occurred when sending the Progression request: ' + textStatus);
            }
        });

        return this;
    };

})(jQuery);
