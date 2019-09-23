module RunNodeBefore
    def self.process(site, payload)
      return if @processed
      system "npm start static" 
      #system "node test.js"
      @processed = true
    end
  end
  
  Jekyll::Hooks.register :site, :pre_render do |site, payload|
    RunNodeBefore.process(site, payload)
  end