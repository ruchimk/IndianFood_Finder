class HomeController < ApplicationController
  def index
  end

  def search
    # pry -r ./config/environment (to use PRY instead of IRB as REPL)
    parameters = { term: "indian restaurants", limit: 16}
    # coordinates = { latitude: 37.7577, longitude: -122.4376 }
    # render json: Yelp.client.search('San Francisco', parameters)
    render json: Yelp.client.search_by_coordinates(coordinates, parameters)
  end

end
