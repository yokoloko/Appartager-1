// ==UserScript==
// @name        Appartager
// @namespace   http://www.appartager.com
// @description Lister les colloc'
// @include     www.appartager.com
// @version     1
// @require     http://code.jquery.com/jquery-1.7.2.min.js
// ==/UserScript==
//alert('alert1');


 console.debug('start: add CSS');
// var cssTxt  = GM_getResourceText("style");
// GM_addStyle (cssTxt);
 console.debug('done: add CSS');

 alert('alert3');

$(function () {
	'use strict';
	var $pages = $('.erm-pages a'), finished = 0, cachedAnnonces = {},
	    $menu = $('<ul id="papa-annonce-menu"></ul>');
	alert('alert4');
	if (GM_getValue('annonces')) {
		cachedAnnonces = JSON.parse(GM_getValue('annonces'))
	}
	alert('alert5');
	var rewriteCache = function () {
	    GM_setValue('annonces', JSON.stringify(cachedAnnonces));
	}

	var rewriteMenu = function () {
		$menu.html('');

		$.each(cachedAnnonces, function(key, annonce) {
			var $li = $('<li></li>');
			var $link = $('<a data-papa-annonce-id="' + annonce.id + '" href="' + annonce.href + '">' + annonce.id + '</a>');

			if (annonce.visited === true) {
				$li.addClass('visited');
			}

			$menu.append($li.append($link));
		});

		$('body').append($menu);
	}

	rewriteMenu();

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
							annonce.id      = id;
							annonce.href    = $(this).attr('href');
							annonce.visited = false;

							cachedAnnonces[id] = annonce;
						}
					}
				});
			});

			finished += 1;
		});
	});

	var timer = window.setInterval(function() {
		if ($pages.length > 0 && finished === $pages.length) {
			rewriteCache();
			rewriteMenu();

			clearTimeout(timer);
		}
	}, 2000);

	$('a[data-papa-annonce-id]').live('click', function(event) {
		var $elt = $(this), ref = $elt.data('papa-annonce-id');

		cachedAnnonces[ref].visited = true;

		rewriteCache();
	});

});
