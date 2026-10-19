<?php
/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Zero_MarketingPixels: Meta Pixel, TikTok Pixel, Pinterest Tag and Microsoft
 * Clarity on the Zero storefront, from the same e-commerce events as Google
 * Analytics (Zero_GoogleAnalytics), each loaded only after the visitor's
 * consent (Zero_Consent).
 */

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(ComponentRegistrar::MODULE, 'Zero_MarketingPixels', __DIR__);
