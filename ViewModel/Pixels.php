<?php
/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 */

declare(strict_types=1);

namespace Zero\MarketingPixels\ViewModel;

use Magento\Framework\View\Element\Block\ArgumentInterface;
use Zero\MarketingPixels\Model\Config;

/**
 * pixels.js's settings: the active pixels and their IDs.
 */
class Pixels implements ArgumentInterface
{
    public function __construct(
        private readonly Config $config
    ) {
    }

    /**
     * @return array<string, string>
     */
    public function settings(): array
    {
        return $this->config->active();
    }
}
