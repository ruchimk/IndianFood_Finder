class HomeController < ApplicationController
  def index
  end

  def search
    parameters = { term: "indian restaurants", limit: 16 }
    render json: Yelp.client.search('San Francisco', parameters)
  end

end
