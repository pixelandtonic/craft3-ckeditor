<?php

namespace craft\ckeditor\helpers;

use Craft;

final class CkeditorConfig
{
    private static function normalizeToolbarItem($item): array
    {
        if (is_string($item)) {
            return [
                ['button' => $item]
            ];
        }

        if (array_is_list($item)) {
            return collect($item)->map(fn($item) => ['button' => $item])->toArray();
        }

        return [$item];
    }

    public static function normalizeToolbarItems($items): array
    {
        return collect($items)
            ->map(fn($item) => self::normalizeToolbarItem($item))
            ->toArray();
    }
}
