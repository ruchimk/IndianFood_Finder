class HomeController < ApplicationController
  def index
  end

  def search
    # pry -r ./config/environment (to use PRY instead of IRB as REPL)
    params = { term: "indian restaurants", limit: 16}
    coordinates = { latitude: 37.7577, longitude: -122.4376 } || { latitude: params[:lat], longitude: params[:lng] }
    locale = { lang: 'en' }
    render json: Yelp.client.search_by_coordinates(coordinates, params, locale)
  end

end
