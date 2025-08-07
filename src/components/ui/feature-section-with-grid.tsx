import { Badge } from "@/components/ui/badge";
import { usePersistedRecipes } from "@/hooks/usePersistedRecipes";

function RecipeGrid() {
  const [recipes, setRecipes] = usePersistedRecipes();

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
  };

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge>Recipes</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
                My Recipe Collection
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="flex flex-col gap-2 group relative">
                  <div className="bg-muted rounded-md aspect-video mb-2 overflow-hidden">
                    {recipe.image ? (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl tracking-tight">{recipe.title}</h3>
                  <p className="text-muted-foreground text-base">
                    {recipe.ingredients?.length > 0 
                      ? `${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}`
                      : 'No ingredients listed'
                    }
                  </p>
                  
                  {recipe.id && (
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id!)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  );
}

export { RecipeGrid };