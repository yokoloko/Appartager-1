// ==UserScript==
// @name        Appartager
// @namespace   http://www.appartager.com
// @description Lister les colloc'
// @include     www.appartager.com
// @version     1
// @require     http://code.jquery.com/jquery-1.7.2.min.js
// @resource    style https://raw.github.com/yokoloko/Appartager-1/master/style.css
// ==/UserScript==


var cssTxt  = GM_getResourceText("style");
GM_addStyle (cssTxt);

$(function () {
    'use strict';
    var $pages = $('.erm-pages a'), finished = 0, cachedAnnonces = {},
        $container = $('<div id="papa-container"></div>'), $menu = $('<ul id="papa-annonce-menu"></ul>'),
        $visible = false, className = ' hide';

    $('.erm-header-navbar-links').find('li:last').after('<li class="erm-float-left erm-navbar-divider"></li><li class="erm-float-left"><a class="erm-white erm-hover" id="papa-launcher" href="#">Simplificateur de recherche.</a></li>');

    $('.green_upgrade').remove();

    $('body').append('<div id="loading-content"></div>');
    $('body').append($container);

    if (!GM_getValue('visible') || GM_getValue('visible') !== 'visible') {
        $container.hide();
    }

    if (GM_getValue('annonces')) {
	cachedAnnonces = JSON.parse(GM_getValue('annonces'))
    }

    var rewriteCache = function () {
	GM_setValue('annonces', JSON.stringify(cachedAnnonces));
    }

    var appendAnnonces = function (annonces) {
        $.each(annonces, function() {
            var annonces = $(this);

	    $.each(annonces, function(key, annonce) {
	        var $li = $('<li></li>');
	        var $link = $('<a class="erm-white erm-hover" data-papa-annonce-id="' + annonce.id + '" href="' + annonce.href + '">' + annonce.title + '</a>');

	        if (annonce.visited === true) {
		    $li.addClass('visited');
	        }

	        $menu.append($li.append($link));
	    });
        });
    };

    var rewriteMenu = function () {
        var visited = {}, news = {};
	$menu.html('');

        $.each(cachedAnnonces, function(key, annonce) {
            if (annonce.visited) {
                visited[annonce.id] = annonce;
            } else {
                news[annonce.id] = annonce;
            }
        });

        appendAnnonces(news);
        appendAnnonces(visited);

	$container.append($menu);
    }

    rewriteMenu();

    var refreshCache = function () {
        var found = 0;
        $pages.each(function () {
	    var $elt = $(this);

	    $.get($elt.attr('href'), function (html) {
	        // Traite le resultat de la page ouverte
	        var $listings = $(html).find('.erm-listings .erm-listing');

	        $listings.each(function () {
		    // Pour chaque utilisateur
		    var $elt = $(this), annonce = {}, id;

		    $elt.find('a').each(function () {
		        // pour chaque lien trouvé
		        var href = $(this).attr('href');

		        if (typeof href === 'undefined') {
			    return;
		        }
		        var tmp = href.match(/\/content\/common\/listingdetail.aspx\?code=(.*)&from=.*/);

		        if (tmp) {
			    id = tmp[1];

			    if (typeof cachedAnnonces[id] === 'undefined') {
                                found ++;
			        annonce.id      = id;
			        annonce.href    = $(this).attr('href');
			        annonce.visited = false;

                                annonce.title   = $elt.find('.erm-listing-details strong').text();

			        cachedAnnonces[id] = annonce;
			    }

                            return false;
		        }
		    });
	        });

	        finished += 1;
	    });
        });

        var timer = window.setInterval(function() {
	    if ($pages.length > 0 && finished === $pages.length) {
                alert(found + ' utilisateurs trouves.');

	        rewriteCache();
	        rewriteMenu();

	        clearTimeout(timer);
	    }
        }, 2000);
    }

    $('a[data-papa-annonce-id]').live('click', function(event) {
	var $elt = $(this), ref = $elt.data('papa-annonce-id');

	cachedAnnonces[ref].visited = true;

	rewriteCache();
    });

    if ($pages.length > 0) {
        $container.prepend('<button id="papa-refresh" type="submit">Refresh cache</button>');

        $('#papa-refresh').live('click', function(event) {
            refreshCache();
        });
    } else {
        $container.prepend('<strong>Vous devez etre sur la page de recherche pour rafraichir le cache.</strong>');
    }


    $('#loading-content')
        .ajaxStart(function() {
            var msg = $('<div id="infscr-loading"><img alt="Loading..." src="http://i.imgur.com/6RMhx.gif" /><div>chargement</div></div>');

            $('#loading-content').html(msg).show();
        })
        .ajaxStop(function() {
            $('#loading-content').hide();
        });

    $('#papa-launcher').click(function() {
        $container.toggle();

        if ($container.is(':visible')) {
            GM_setValue('visible', 'visible');
        } else {
            GM_setValue('visible', 'hide');
        }
    });
});
