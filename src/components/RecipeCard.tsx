import * as React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button } from '@mui/material';


export default function RecipeCard({ recipe }) {
  return (
    <Card sx={{ maxWidth: 345, margin: 2 }}>
      <CardMedia
        component="img"
        height="140"
        image={recipe.image || '/default-recipe.jpg'}
        alt={recipe.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {recipe.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prep time: {recipe.prep_time} | Cook time: {recipe.cook_time}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Edit</Button>
        <Button size="small">View Recipe</Button>
      </CardActions>
    </Card>
  );
}