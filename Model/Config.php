<?php
/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 */

declare(strict_types=1);

namespace Zero\MarketingPixels\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

/**
 * Stores > Configuration > Zero > Marketing Pixels, for the current store
 * view: the pixels switched on with a well-formed ID.
 */
class Config
{
    public const META = 'meta';
    public const TIKTOK = 'tiktok';
    public const PINTEREST = 'pinterest';
    public const CLARITY = 'clarity';

    /** Pixel => [ID field, the ID's pattern]. */
    private const IDS = [
        self::META => ['pixel_id', '/^\d{6,20}$/'],
        self::TIKTOK => ['pixel_id', '/^[A-Z0-9]{8,32}$/'],
        self::PINTEREST => ['tag_id', '/^\d{6,20}$/'],
        self::CLARITY => ['project_id', '/^[a-z0-9]{6,20}$/'],
    ];

    public function __construct(
        private readonly ScopeConfigInterface $scopeConfig
    ) {
    }

    /**
     * @return array<string, string> pixel => ID, the active ones only
     */
    public function active(): array
    {
        $active = [];
        foreach (self::IDS as $pixel => [$field, $pattern]) {
            if (!$this->scopeConfig->isSetFlag('zero_pixels/' . $pixel . '/enabled', ScopeInterface::SCOPE_STORE)) {
                continue;
            }
            $id = trim((string) $this->scopeConfig->getValue('zero_pixels/' . $pixel . '/' . $field, ScopeInterface::SCOPE_STORE));
            $id = $pixel === self::TIKTOK ? strtoupper($id) : ($pixel === self::CLARITY ? strtolower($id) : $id);
            if (preg_match($pattern, $id)) {
                $active[$pixel] = $id;
            }
        }

        return $active;
    }

    public function isActive(): bool
    {
        return $this->active() !== [];
    }
}
