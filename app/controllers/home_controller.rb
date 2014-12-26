class HomeController < ApplicationController
  def index
  end

  def search
    parameters = { term: "indian restaurants", limit: 10 }
    # render json: Yelp.client.search('San Francisco', parameters)
    render json: Yelp.client.search_by_coordinates(coordinates, parameters)
  end

end
