import React from "react";
import { useTheme } from "@mui/material";
import NebulaSpaceBackground from "./NebulaSpaceBackground";
import PremiumLightBackground from "./PremiumLightBackground";

/**
 * Adaptive Auth Background - 自适应登录背景
 *
 * 根据主题模式自动切换背景：
 * - 暗黑模式：梦幻星空背景
 * - 白色模式：高级流动线条和发光粒子背景
 */
const AdaptiveAuthBackground: React.FC = () => {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   return isDark ? <NebulaSpaceBackground /> : <PremiumLightBackground />;
};

export default AdaptiveAuthBackground;
