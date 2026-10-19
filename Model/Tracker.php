<?php
/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 */

declare(strict_types=1);

namespace Zero\MarketingPixels\Model;

use Zero\Consent\Api\TrackerInterface;
use Zero\GoogleAnalytics\Api\EventListenerInterface;

/**
 * The pixels in the cookie banner (what each uses cookies for) and as a user
 * of the storefront's e-commerce events (Zero_GoogleAnalytics collects them
 * while a pixel is on, even without Google Analytics).
 */
class Tracker implements TrackerInterface, EventListenerInterface
{
    public function __construct(
        private readonly Config $config
    ) {
    }

    public function isActive(): bool
    {
        return $this->config->isActive();
    }

    public function purposes(): array
    {
        $active = $this->config->active();
        $purposes = [];
        $ads = array_values(array_filter([
            isset($active[Config::META]) ? 'Meta (Facebook, Instagram)' : null,
            isset($active[Config::TIKTOK]) ? 'TikTok' : null,
            isset($active[Config::PINTEREST]) ? 'Pinterest' : null,
        ]));
        if ($ads) {
            $purposes[self::MARKETING] = __('measuring our ads and showing them to you on other sites (%1).', implode(', ', $ads));
        }
        if (isset($active[Config::CLARITY])) {
            $purposes[self::ANALYTICS] = __('how the pages are used: heatmaps and recordings, with what you type hidden (Microsoft Clarity).');
        }

        return $purposes;
    }
}
