import React from "react";
import { Button, Stack } from "@mui/material";
import { ThumbUpOffAlt, ThumbUp } from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";

type LikeFavoriteProps = {
   isLiked: boolean;
   likeCount?: number;
   liking?: boolean;
   isFavorited: boolean;
   onToggleLike: () => void;
   onToggleFavorite: () => void;
};

const LikeFavorite: React.FC<LikeFavoriteProps> = ({
   isLiked,
   likeCount,
   liking,
   isFavorited,
   onToggleLike,
   onToggleFavorite,
}) => {
   return (
      <Stack direction="row" spacing={1.5} alignItems="center">
         {/* Like button: outlined shape like ProjectMeta buttons */}
         <Button
            variant="outlined"
            size="small"
            onClick={onToggleLike}
            startIcon={
               isLiked ? (
                  <ThumbUp fontSize="small" />
               ) : (
                  <ThumbUpOffAlt fontSize="small" />
               )
            }
            disabled={!!liking}
            sx={{
               borderRadius: 4,
               textTransform: "none",
               fontWeight: 600,
               px: 2,
               py: 0.3,
               minHeight: 30,
               fontSize: 13,
               borderColor: isLiked ? "error.main" : "grey.400",
               color: isLiked ? "error.main" : "grey.700",
               "&:hover": {
                  borderColor: isLiked ? "error.dark" : "grey.600",
                  bgcolor: "action.hover",
               },
            }}
         >
            Like{typeof likeCount === "number" ? ` (${likeCount})` : ""}
         </Button>

         {/* Favorite button: outlined shape */}
         <Button
            variant="outlined"
            size="small"
            onClick={onToggleFavorite}
            startIcon={<StarIcon fontSize="small" />}
            sx={{
               borderRadius: 4,
               textTransform: "none",
               fontWeight: 600,
               px: 2,
               py: 0.3,
               minHeight: 30,
               fontSize: 13,
               borderColor: isFavorited ? "warning.main" : "grey.400",
               color: isFavorited ? "warning.main" : "grey.700",
               "&:hover": {
                  borderColor: isFavorited ? "warning.dark" : "grey.600",
                  bgcolor: "action.hover",
               },
            }}
         >
            {isFavorited ? "Favorites" : "Add to Favorites"}
         </Button>
      </Stack>
   );
};

export default LikeFavorite;
