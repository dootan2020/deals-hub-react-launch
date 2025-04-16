
-- Create a function to update category count
CREATE OR REPLACE FUNCTION public.update_category_count(category_id_param TEXT, count_param INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.categories
  SET count = count_param
  WHERE id = category_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function to insert a new category
CREATE OR REPLACE FUNCTION public.insert_category(
  name_param TEXT,
  description_param TEXT,
  slug_param TEXT,
  image_param TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.categories (name, description, slug, image, count)
  VALUES (name_param, description_param, slug_param, image_param, 0);
END;
$$ LANGUAGE plpgsql;

-- Create a function to update a category
CREATE OR REPLACE FUNCTION public.update_category(
  id_param TEXT,
  name_param TEXT,
  description_param TEXT,
  slug_param TEXT,
  image_param TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.categories
  SET 
    name = name_param,
    description = description_param,
    slug = slug_param,
    image = image_param,
    updated_at = now()
  WHERE id = id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function to delete a category
CREATE OR REPLACE FUNCTION public.delete_category(id_param TEXT)
RETURNS void AS $$
BEGIN
  DELETE FROM public.categories
  WHERE id = id_param;
END;
$$ LANGUAGE plpgsql;
