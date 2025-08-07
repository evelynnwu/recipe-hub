import { Card, CardContent, CardMedia, Typography, CardActions, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Recipe } from '../types/Recipe';

export default function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete?: (id: string) => void }) {
  const theme = useTheme();
  
  const handleDelete = () => {
    if (onDelete && recipe.id) {
      onDelete(recipe.id);
    }
  };

  return (
    <Card sx={{ width: 345, height: 300, margin: 2, backgroundColor: theme.palette.primary.light }}>
      <CardMedia
        component="img"
        height="140"
        image={recipe.image}
        alt={recipe.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" fontSize="20px" component="div" align="left" sx={{
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
        {onDelete && <Button size="small" onClick={handleDelete} sx={{color: "#000000"}}>Delete</Button>}
        <Button size="small" sx={{color: "#000000"}}>View Recipe</Button>
      </CardActions>
    </Card>
  );
}