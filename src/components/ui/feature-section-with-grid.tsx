import type { Recipe } from "@/types/Recipe";
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Modal, Box, Typography, IconButton, Button, TextField } from '@mui/material'
interface RecipeGridProps {
  recipes: Recipe[];
  onDeleteRecipe: (id: string) => void;
  onUpdateRecipe?: (id: string, updatedData: Partial<Recipe>) => Promise<void>;
}

function RecipeGrid({ recipes, onDeleteRecipe, onUpdateRecipe }: RecipeGridProps) {
  const theme = useTheme();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Partial<Recipe>>({});

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setEditedRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cook_time: recipe.cook_time,
      prep_time: recipe.prep_time
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecipe(null);
    setIsEditing(false);
    setEditedRecipe({});
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedRecipe) {
      setEditedRecipe({
        title: selectedRecipe.title,
        ingredients: selectedRecipe.ingredients,
        instructions: selectedRecipe.instructions,
        cook_time: selectedRecipe.cook_time,
        prep_time: selectedRecipe.prep_time
      });
    }
  };

  const handleSaveEdit = async () => {
    if (selectedRecipe && onUpdateRecipe && selectedRecipe.id) {
      try {
        await onUpdateRecipe(selectedRecipe.id, editedRecipe);
        setSelectedRecipe({ ...selectedRecipe, ...editedRecipe });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update recipe:', error);
      }
    }
  };

  const handleFieldChange = (field: keyof Recipe, value: any) => {
    setEditedRecipe(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 flex-col items-start">
            <div className="flex gap-2 flex-col">
              <h2 className="h3 text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
                Saved Recipe Collection
              </h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                Discover and save your favorite recipes from around the web.
              </p>
            </div>
          </div>
          
          {recipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No recipes saved yet. Add your first recipe above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-12 px-4 sm:px-6 lg:px-8">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="flex flex-col group relative h-100">
                  <div 
                    className="bg-muted rounded-md aspect-[3/4] mb-2 overflow-hidden cursor-pointer relative"
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    {recipe.image ? (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-70"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center transition-opacity duration-300 hover:opacity-70">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="text-xl font-semibold line-clamp-2">{recipe.title}</h3>
                    <p className="text-muted-foreground text-base">
                      {recipe.cook_time
                        ? `Cook time: ${recipe.cook_time} mins`
                        : 'Cook time not available'
                      }
                    </p>
                  </div>
                  
                  {recipe.id && (
                    <button
                      onClick={() => onDeleteRecipe(recipe.id!)}
                      className="absolute top-2 right-2 hover:bg-gray text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity"
                      aria-label="Delete recipe"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recipe Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="recipe-modal-title"
        aria-describedby="recipe-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '60%' },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: theme.palette.primary.main,
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: 'auto'
        }}>
          {selectedRecipe && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {isEditing ? (
                  <TextField
                    variant="outlined"
                    value={editedRecipe.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    sx={{ flexGrow: 1, mr: 2 }}
                    InputProps={{
                      sx: { fontSize: '2.125rem', fontWeight: 'bold' }
                    }}
                  />
                ) : (
                  <Typography id="recipe-modal-title" variant="h4" component="h2">
                    {selectedRecipe.title}
                  </Typography>
                )}
                <Box>
                  {onUpdateRecipe && !isEditing && (
                    <Button onClick={handleEditClick} sx={{backgroundColor: theme.palette.primary.darker, color: "#FFFFFF", mr: 1 }}>
                      Edit
                    </Button>
                  )}
                  <IconButton onClick={handleCloseModal}>
                    ×
                  </IconButton>
                </Box>
              </Box>

              {selectedRecipe.image && (
                <Box sx={{ mb: 3 }}>
                  <img 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.title}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}

              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                    Cook time (mins):
                  </Typography>
                  {isEditing ? (
                    <TextField
                      size="small"
                      type="number"
                      value={editedRecipe.cook_time || ''}
                      onChange={(e) => handleFieldChange('cook_time', e.target.value)}
                      sx={{ width: 100 }}
                    />
                  ) : (
                    <Typography variant="body1">
                      {selectedRecipe.cook_time || 'Not specified'}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                    Prep time (mins):
                  </Typography>
                  {isEditing ? (
                    <TextField
                      size="small"
                      type="number"
                      value={editedRecipe.prep_time || ''}
                      onChange={(e) => handleFieldChange('prep_time', e.target.value)}
                      sx={{ width: 100 }}
                    />
                  ) : (
                    <Typography variant="body1">
                      {selectedRecipe.prep_time || 'Not specified'}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Typography variant="h5" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Ingredients
              </Typography>
              <Box sx={{ mb: 3 }}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={(editedRecipe.ingredients || []).join('\n')}
                    onChange={(e) => handleFieldChange('ingredients', e.target.value.split('\n').filter(line => line.trim()))}
                    variant="outlined"
                    placeholder="Enter each ingredient on a new line"
                  />
                ) : (
                  selectedRecipe.ingredients?.map((ingredient, index) => (
                    <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                      • {ingredient}
                    </Typography>
                  ))
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ color: theme.palette.secondary.main }}>
                  Instructions
                </Typography>
                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small"
                      variant="contained" 
                      onClick={handleSaveEdit}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button 
                      size="small"
                      variant="outlined" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
              <Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={editedRecipe.instructions || ''}
                    onChange={(e) => handleFieldChange('instructions', e.target.value)}
                    variant="outlined"
                    placeholder="Enter cooking instructions"
                  />
                ) : (
                  selectedRecipe.instructions.split('\n').filter(step => step.trim()).map((step, index) => (
                    <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                      {index + 1}. {step.trim()}
                    </Typography>
                  ))
                )}
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export { RecipeGrid };