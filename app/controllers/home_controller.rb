class HomeController < ApplicationController
  def index
  end

  def search
    # pry -r ./config/environment (to use PRY instead of IRB as REPL)
    parameters = { term: "indian restaurants", limit: 10}
    coordinates = { latitude: params[:lat], longitude: params[:lng] } || { latitude: 37.7577, longitude: -122.4376 }
    locale = { lang: 'en' }
    render json: Yelp.client.search_by_coordinates(coordinates, parameters, locale)
  end

end
