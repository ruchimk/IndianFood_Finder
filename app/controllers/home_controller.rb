class HomeController < ApplicationController
  def index
  end

  def search
    render json: Yelp.client.search("San Francisco")
  end

end
