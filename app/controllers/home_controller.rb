class HomeController < ApplicationController
  def index
  end

  def search
    # pry -r ./config/environment (to use PRY instead of IRB as REPL)
    parameters = { term: "restaurants", limit: 16, category_filter: 'indpak', radius_filter: 40000, sort: 2} #Sort mode: 0=Best matched (default), 1=Distance, 2=Highest Rated.
    coordinates = { latitude: params[:lat], longitude: params[:lng] }
    locale = { lang: 'en' }
    render json: Yelp.client.search_by_coordinates(coordinates, parameters, locale)
  end

end
