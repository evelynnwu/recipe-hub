import type { Recipe } from "@/types/Recipe";
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Modal, Box, Typography, IconButton } from '@mui/material'
interface RecipeGridProps {
  recipes: Recipe[];
  onDeleteRecipe: (id: string) => void;
}

function RecipeGrid({ recipes, onDeleteRecipe }: RecipeGridProps) {
  const theme = useTheme();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecipe(null);
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
                <Typography id="recipe-modal-title" variant="h4" component="h2">
                  {selectedRecipe.title}
                </Typography>
                <IconButton onClick={handleCloseModal}>
                  ×
                </IconButton>
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

              {selectedRecipe.cook_time && (
                <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                  Cook time: {selectedRecipe.cook_time} mins
                </Typography>
              )}

              <Typography variant="h5" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Ingredients
              </Typography>
              <Box sx={{ mb: 3 }}>
                {selectedRecipe.ingredients?.map((ingredient, index) => (
                  <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                    • {ingredient}
                  </Typography>
                ))}
              </Box>

              <Typography variant="h5" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Instructions
              </Typography>
              <Box>
                {selectedRecipe.instructions.split('\n').filter(step => step.trim()).map((step, index) => (
                  <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                    {index + 1}. {step.trim()}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export { RecipeGrid };