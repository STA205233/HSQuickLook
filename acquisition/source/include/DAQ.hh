/**
 * MyModule sample module of the ANL Next framework
 *
 * @author 
 * @date
 *
 */

#ifndef DAQ_HH
#define DAQ_HH

#include "BasicModule.hh"

namespace hxisgd { class MongoDBClient; }

class DAQ : public anl::BasicModule
{
public:
  DAQ();
  ~DAQ();

  std::string module_name() const { return "DAQ"; }
  std::string module_version() const { return "1.0"; }
  
  anl::ANLStatus mod_startup();
  anl::ANLStatus mod_init();
  anl::ANLStatus mod_ana();

private:
  hxisgd::MongoDBClient* m_Connection;
  std::string m_Instrument;
  std::string m_ImageFileName;
  int m_ImageHeight;
  int m_ImageWidth;
};

#endif // DAQ_HH
