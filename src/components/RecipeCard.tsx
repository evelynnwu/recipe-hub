import * as React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function RecipeCard({ recipe }) {
  const theme = useTheme();
  return (
    <Card sx={{ maxWidth: 345, margin: 2, backgroundColor: theme.palette.primary.light }}>
      <CardMedia
        component="img"
        height="140"
        image={recipe.image}
        alt={recipe.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" align="left" sx={{
            fontFamily: theme.typography.h1.fontFamily,
            color: "#000000",
          }}>
          {recipe.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prep time: {recipe.prep_time} mins | Cook time: {recipe.cook_time}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" sx={{color: "#000000"}}>Edit</Button>
        <Button size="small" sx={{color: "#000000"}}>View Recipe</Button>
      </CardActions>
    </Card>
  );
}